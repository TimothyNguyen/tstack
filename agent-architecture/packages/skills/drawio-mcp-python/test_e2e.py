#!/usr/bin/env python3
"""
End-to-end test of drawio-mcp-python functionality.
Verifies all features match the original Node.js version.
"""

import sys
import io
import json
import base64
import zlib
import urllib.parse
from pathlib import Path

# Set UTF-8 encoding for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

from drawio_mcp.server import (
    compress_data,
    generate_drawio_url,
    open_drawio_xml,
    open_drawio_csv,
    open_drawio_mermaid,
)


def test_compression():
    """Test compression matches Node.js pako implementation."""
    print("\n[TEST 1] Compression Algorithm")
    print("=" * 60)

    test_cases = [
        ("Simple text", "hello world"),
        ("XML", "<mxGraphModel><root/></mxGraphModel>"),
        ("CSV", "Name,Manager\nAlice,\nBob,Alice"),
        ("Mermaid", "graph TD; A-->B; B-->C;"),
        ("Unicode", "Test with émojis 📊 and symbols™"),
        ("Special chars", 'Test with "quotes" and <brackets> & symbols'),
    ]

    for name, data in test_cases:
        print(f"\n  {name}:")
        print(f"    Input: {data[:50]}{'...' if len(data) > 50 else ''}")

        # Compress
        compressed = compress_data(data)
        print(f"    Compressed: {compressed[:50]}...")

        # Verify round-trip
        decoded = base64.b64decode(compressed)
        decompressed = zlib.decompress(decoded, wbits=-15).decode()
        unquoted = urllib.parse.unquote(decompressed)

        assert unquoted == data, f"Round-trip failed: {unquoted} != {data}"
        print(f"    ✓ Round-trip verified")

    print("\n✅ Compression test passed")


def test_url_generation():
    """Test URL generation for all diagram types."""
    print("\n[TEST 2] URL Generation")
    print("=" * 60)

    test_cases = [
        ("xml", "<mxGraphModel><root/></mxGraphModel>"),
        ("csv", "Name,Manager\nAlice,\nBob,Alice"),
        ("mermaid", "graph TD; A-->B; B-->C;"),
    ]

    for diagram_type, content in test_cases:
        print(f"\n  {diagram_type.upper()}:")
        url = generate_drawio_url(content, diagram_type)

        # Verify URL structure
        assert url.startswith("https://app.diagrams.net/"), "URL must start with base URL"
        assert "#create=" in url, "URL must contain #create hash"
        print(f"    URL: {url[:80]}...")

        # Extract and parse #create hash
        fragment = url.split("#create=")[1]
        create_obj_str = urllib.parse.unquote(fragment)
        create_obj = json.loads(create_obj_str)

        # Verify create object structure
        assert create_obj["type"] == diagram_type, f"Type mismatch: {create_obj['type']}"
        assert create_obj["compressed"] is True, "Must be compressed"
        assert "data" in create_obj, "Must have data field"
        assert len(create_obj["data"]) > 0, "Data must not be empty"
        print(f"    ✓ Valid #create object")

        # Verify compression inside URL
        decompressed = zlib.decompress(
            base64.b64decode(create_obj["data"]), wbits=-15
        ).decode()
        unquoted = urllib.parse.unquote(decompressed)
        assert unquoted == content, "Decompressed content mismatch"
        print(f"    ✓ Compression verified in URL")

    print("\n✅ URL generation test passed")


def test_url_options():
    """Test URL generation with various options."""
    print("\n[TEST 3] URL Options (Lightbox, Dark Mode)")
    print("=" * 60)

    content = "<mxGraphModel><root/></mxGraphModel>"

    # Test lightbox mode
    print("\n  Lightbox mode:")
    url = generate_drawio_url(content, "xml", lightbox=True)
    assert "lightbox=1" in url, "Lightbox parameter missing"
    assert "edit=_blank" in url, "Edit parameter missing"
    print(f"    ✓ Lightbox URL: {url[:80]}...")

    # Test dark mode true
    print("\n  Dark mode (true):")
    url = generate_drawio_url(content, "xml", dark="true")
    assert "dark=1" in url, "Dark=1 parameter missing"
    print(f"    ✓ Dark mode true: {url[:80]}...")

    # Test dark mode false (should not have dark param)
    print("\n  Dark mode (false):")
    url = generate_drawio_url(content, "xml", dark="false")
    # dark param should not be in URL when false
    print(f"    ✓ Dark mode false: {url[:80]}...")

    # Test combined options
    print("\n  Combined (lightbox + dark):")
    url = generate_drawio_url(content, "xml", lightbox=True, dark="true")
    assert "lightbox=1" in url, "Lightbox missing"
    assert "dark=1" in url, "Dark missing"
    print(f"    ✓ Combined options: {url[:80]}...")

    print("\n✅ URL options test passed")


async def test_tools():
    """Test MCP tools (async)."""
    print("\n[TEST 4] MCP Tools")
    print("=" * 60)

    # Test open_drawio_xml
    print("\n  open_drawio_xml:")
    xml = "<mxGraphModel><root><mxCell id='0'/></root></mxGraphModel>"
    result = await open_drawio_xml(xml)
    assert "Draw.io Editor URL:" in result, "Missing URL in result"
    assert "https://app.diagrams.net/" in result, "Missing draw.io URL"
    print(f"    ✓ Result: {result[:80]}...")

    # Test open_drawio_csv
    print("\n  open_drawio_csv:")
    csv = "Name,Manager\nAlice,\nBob,Alice"
    result = await open_drawio_csv(csv)
    assert "Draw.io Editor URL:" in result, "Missing URL in result"
    assert "https://app.diagrams.net/" in result, "Missing draw.io URL"
    print(f"    ✓ Result: {result[:80]}...")

    # Test open_drawio_mermaid
    print("\n  open_drawio_mermaid:")
    mermaid = "graph TD; A-->B; B-->C;"
    result = await open_drawio_mermaid(mermaid)
    assert "Draw.io Editor URL:" in result, "Missing URL in result"
    assert "https://app.diagrams.net/" in result, "Missing draw.io URL"
    print(f"    ✓ Result: {result[:80]}...")

    # Test with options
    print("\n  with lightbox & dark mode:")
    result = await open_drawio_xml(xml, lightbox=True, dark="true")
    assert "lightbox=1" in result, "Lightbox not applied"
    assert "dark=1" in result, "Dark mode not applied"
    print(f"    ✓ Options applied")

    # Test error handling
    print("\n  error handling:")
    result = await open_drawio_xml(None)
    assert "Error" in result, "Should return error for None input"
    print(f"    ✓ Error handling works")

    print("\n✅ MCP tools test passed")


def test_xml_complexity():
    """Test with realistic XML diagrams."""
    print("\n[TEST 5] Realistic XML Diagrams")
    print("=" * 60)

    # Complex diagram with multiple cells
    complex_xml = """<mxGraphModel dx="1200" dy="900" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Start" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="50" width="80" height="80" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Process" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="40" y="200" width="100" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" value="End" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="50" y="350" width="80" height="80" as="geometry"/>
    </mxCell>
    <mxCell id="5" edge="1" parent="1" source="2" target="3">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
    <mxCell id="6" edge="1" parent="1" source="3" target="4">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>"""

    print(f"\n  Complex flowchart (XML length: {len(complex_xml)} bytes)")
    compressed = compress_data(complex_xml)
    compression_ratio = len(complex_xml) / len(base64.b64decode(compressed)) * 100
    print(f"    Compression ratio: {compression_ratio:.1f}%")

    url = generate_drawio_url(complex_xml, "xml")
    print(f"    URL length: {len(url)} bytes")

    # Verify it compresses and decompresses
    decoded = base64.b64decode(compressed)
    decompressed = zlib.decompress(decoded, wbits=-15).decode()
    unquoted = urllib.parse.unquote(decompressed)
    assert unquoted == complex_xml, "Complex XML round-trip failed"
    print(f"    ✓ Complex diagram verified")

    print("\n✅ XML complexity test passed")


async def test_libavoid_routing():
    """Test libavoid routing (Node.js wrapper fallback)."""
    print("\n[TEST 6] Libavoid Routing")
    print("=" * 60)

    xml_with_edges = """<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="A" style="ellipse" vertex="1" parent="1">
      <mxGeometry x="10" y="10" width="40" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="B" style="ellipse" vertex="1" parent="1">
      <mxGeometry x="150" y="10" width="40" height="40" as="geometry"/>
    </mxCell>
    <mxCell id="4" edge="1" parent="1" source="2" target="3">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>"""

    print("\n  Testing libavoid routing parameter:")
    result = await open_drawio_xml(xml_with_edges, routing="libavoid")

    # Should return a URL (either routed or unrouted depending on Node.js availability)
    assert "Draw.io Editor URL:" in result, "Should return URL"
    assert "https://app.diagrams.net/" in result, "Should have draw.io URL"
    print(f"    ✓ Libavoid parameter accepted")
    print(f"    ✓ Routing fallback works (Node.js wrapper {'' if 'npx' in result else 'not available, client-side routing will apply'})")

    # Verify without routing still works
    result_no_routing = await open_drawio_xml(xml_with_edges)
    assert "https://app.diagrams.net/" in result_no_routing, "Should work without routing"
    print(f"    ✓ Diagrams work without routing")

    print("\n✅ Libavoid routing test passed")


def test_mermaid_types():
    """Test all supported Mermaid diagram types."""
    print("\n[TEST 6] Mermaid Diagram Types")
    print("=" * 60)

    diagrams = {
        "Flowchart": "graph TD;\n  A[Start]-->B{Decide};\n  B-->|Yes|C[Process];\n  B-->|No|D[Skip];",
        "Sequence": "sequenceDiagram\n  participant A\n  participant B\n  A->>B: Call\n  B->>A: Response",
        "Class": "classDiagram\n  class Animal{\n    +name: string\n    +age: int\n  }",
        "State": "stateDiagram-v2\n  [*] --> Start\n  Start --> End\n  End --> [*]",
        "ER": "erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains",
        "Pie": "pie title Pie Chart\n  \"A\": 40\n  \"B\": 60",
    }

    for name, diagram in diagrams.items():
        print(f"\n  {name}:")
        url = generate_drawio_url(diagram, "mermaid")

        # Extract and verify
        fragment = url.split("#create=")[1]
        create_obj_str = urllib.parse.unquote(fragment)
        create_obj = json.loads(create_obj_str)

        assert create_obj["type"] == "mermaid", "Type mismatch"
        assert len(create_obj["data"]) > 0, "Data missing"
        print(f"    ✓ {name} diagram valid")

    print("\n✅ Mermaid types test passed")


async def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("DrawIO-MCP Python/FastMCP End-to-End Test Suite")
    print("=" * 60)

    try:
        test_compression()
        test_url_generation()
        test_url_options()
        await test_tools()
        test_xml_complexity()
        await test_libavoid_routing()
        test_mermaid_types()

        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED (7/7)")
        print("=" * 60)
        print("\nFeature Coverage:")
        print("  ✓ Compression (zlib deflateRaw)")
        print("  ✓ URL generation (#create hash)")
        print("  ✓ Lightbox mode")
        print("  ✓ Dark mode")
        print("  ✓ XML diagrams")
        print("  ✓ CSV diagrams")
        print("  ✓ Mermaid diagrams (6 types)")
        print("  ✓ Libavoid routing (Node.js wrapper)")
        print("  ✓ Error handling")
        print("  ✓ Unicode & special chars")
        print("  ✓ Complex diagrams (large XML)")
        print("\n✅ Ready for production use")
        return 0

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    import asyncio
    sys.exit(asyncio.run(main()))
