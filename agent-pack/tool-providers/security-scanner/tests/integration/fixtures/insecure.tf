# Terraform with known Checkov findings: public S3, unencrypted
resource "aws_s3_bucket" "insecure" {
  bucket = "my-insecure-bucket"
}

resource "aws_s3_bucket_public_access_block" "insecure" {
  bucket = aws_s3_bucket.insecure.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
