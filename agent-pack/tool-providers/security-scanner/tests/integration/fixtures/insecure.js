// JavaScript with known Semgrep findings
const SECRET = "sk-1234567890abcdef1234567890abcdef";

function executeUserInput(input) {
    eval(input);
}

document.write("<script>alert('xss')</script>");
