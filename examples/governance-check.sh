#!/bin/bash
# Example: Running Governance Checks

echo "=== Running Governance Validation ==="
echo ""

# Run all checks
echo "1. Full validation (hard + soft gates):"
npm run governance:check
echo ""

# Run hard gates only
echo "2. Hard gates only (fast check):"
npm run governance:check:hard
echo ""

# Run soft gates only
echo "3. Soft gates only (warnings):"
npm run governance:check:soft
echo ""

# Generate health report
echo "4. Repository health:"
npm run governance:health
echo ""

# Generate scorecard
echo "5. Quality scorecard:"
npm run governance:report
echo ""

# Validate component structure
echo "6. Component validation:"
npm run governance:validate
echo ""

echo "=== Validation Complete ==="
