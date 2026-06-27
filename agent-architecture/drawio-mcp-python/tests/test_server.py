"""Tests for draw.io MCP server."""

import pytest
import zlib
import base64
import json
import urllib.parse
from drawio_mcp.server import (
    compress_data,
    generate_drawio_url,
    open_drawio_xml,
    open_drawio_csv,
    open_drawio_mermaid,
)


class TestCompression:
    """Test data compression algorithm."""

    def test_compress_empty_string(self):
        """Empty string should return unchanged."""
        result = compress_data("")
        assert result == ""

    def test_compress_simple_string(self):
        """Test compression of a simple string."""
        data = "hello world"
        result = compress_data(data)

        # Result should be base64 encoded
        assert isinstance(result, str)

        # Should be able to decode back
        compressed = base64.b64decode(result)
        decompressed = zlib.decompress(compressed, wbits=-15).decode()
        assert urllib.parse.unquote(decompressed) == data

    def test_compress_xml(self):
        """Test compression of XML content."""
        xml = '<mxGraphModel><root><mxCell id="0"/></root></mxGraphModel>'
        result = compress_data(xml)

        # Verify round-trip
        compressed = base64.b64decode(result)
        decompressed = zlib.decompress(compressed, wbits=-15).decode()
        assert urllib.parse.unquote(decompressed) == xml


class TestUrlGeneration:
    """Test URL generation for draw.io."""

    def test_generate_url_xml(self):
        """Test URL generation for XML diagram."""
        data = "<mxGraphModel><root/></mxGraphModel>"
        url = generate_drawio_url(data, "xml")

        assert url.startswith("https://app.diagrams.net/")
        assert "#create=" in url
        assert "grid=0" in url
        assert "pv=0" in url

    def test_generate_url_csv(self):
        """Test URL generation for CSV diagram."""
        data = "Name,Manager\nAlice,\nBob,Alice"
        url = generate_drawio_url(data, "csv")

        assert url.startswith("https://app.diagrams.net/")
        assert "#create=" in url
        assert "type%22%3A%22csv%22" in url or "type" in url

    def test_generate_url_mermaid(self):
        """Test URL generation for Mermaid diagram."""
        data = "graph TD; A-->B; B-->C;"
        url = generate_drawio_url(data, "mermaid")

        assert url.startswith("https://app.diagrams.net/")
        assert "#create=" in url

    def test_url_contains_compressed_data(self):
        """Test that generated URL contains compressed data."""
        data = "test diagram"
        url = generate_drawio_url(data, "xml")

        # Extract #create fragment
        fragment = url.split("#create=")[1]
        create_obj_str = urllib.parse.unquote(fragment)
        create_obj = json.loads(create_obj_str)

        assert create_obj["type"] == "xml"
        assert create_obj["compressed"] is True
        assert "data" in create_obj
        assert len(create_obj["data"]) > 0

    def test_url_lightbox_mode(self):
        """Test URL generation with lightbox mode."""
        data = "test"
        url = generate_drawio_url(data, "xml", lightbox=True)

        assert "lightbox=1" in url
        assert "edit=_blank" in url

    def test_url_dark_mode(self):
        """Test URL generation with dark mode."""
        data = "test"
        url = generate_drawio_url(data, "xml", dark="true")

        assert "dark=1" in url

    def test_url_no_dark_mode(self):
        """Test URL generation without dark mode."""
        data = "test"
        url = generate_drawio_url(data, "xml", dark="false")

        # Should not have dark parameter
        assert "dark=0" not in url or "dark=false" not in url


class TestTools:
    """Test MCP tools."""

    @pytest.mark.asyncio
    async def test_open_drawio_xml_valid(self):
        """Test open_drawio_xml with valid XML."""
        xml = "<mxGraphModel><root/></mxGraphModel>"
        result = await open_drawio_xml(xml)

        assert "Draw.io Editor URL:" in result
        assert "https://app.diagrams.net/" in result

    @pytest.mark.asyncio
    async def test_open_drawio_xml_invalid_type(self):
        """Test open_drawio_xml with invalid content type."""
        result = await open_drawio_xml(None)
        assert "Error" in result

    @pytest.mark.asyncio
    async def test_open_drawio_csv_valid(self):
        """Test open_drawio_csv with valid CSV."""
        csv = "Name,Manager\nAlice,\nBob,Alice"
        result = await open_drawio_csv(csv)

        assert "Draw.io Editor URL:" in result
        assert "https://app.diagrams.net/" in result

    @pytest.mark.asyncio
    async def test_open_drawio_mermaid_valid(self):
        """Test open_drawio_mermaid with valid Mermaid."""
        mermaid = "graph TD; A-->B; B-->C;"
        result = await open_drawio_mermaid(mermaid)

        assert "Draw.io Editor URL:" in result
        assert "https://app.diagrams.net/" in result

    @pytest.mark.asyncio
    async def test_open_drawio_xml_with_lightbox(self):
        """Test XML tool with lightbox mode."""
        xml = "<mxGraphModel><root/></mxGraphModel>"
        result = await open_drawio_xml(xml, lightbox=True)

        assert "Draw.io Editor URL:" in result
        assert "lightbox=1" in result

    @pytest.mark.asyncio
    async def test_open_drawio_xml_with_dark_mode(self):
        """Test XML tool with dark mode."""
        xml = "<mxGraphModel><root/></mxGraphModel>"
        result = await open_drawio_xml(xml, dark="true")

        assert "Draw.io Editor URL:" in result
        assert "dark=1" in result


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_compress_unicode(self):
        """Test compression with unicode characters."""
        data = "diagram with emoji 📊 and symbols"
        result = compress_data(data)

        # Verify round-trip
        compressed = base64.b64decode(result)
        decompressed = zlib.decompress(compressed, wbits=-15).decode()
        assert urllib.parse.unquote(decompressed) == data

    def test_compress_large_content(self):
        """Test compression with large content."""
        data = "<mxGraphModel>" + "<mxCell/>" * 1000 + "</mxGraphModel>"
        result = compress_data(data)

        # Result should be significantly smaller than original
        assert len(result) < len(data)

    def test_url_special_characters(self):
        """Test URL generation with special characters."""
        data = 'Test with "quotes" and <brackets> & symbols'
        url = generate_drawio_url(data, "xml")

        assert isinstance(url, str)
        assert "https://app.diagrams.net/" in url
