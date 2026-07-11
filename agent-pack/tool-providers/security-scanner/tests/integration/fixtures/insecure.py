# Python with known Bandit findings
import subprocess

PASSWORD = "SuperSecret123"  # B105: hardcoded_password_string

def run_cmd(user_input):
    subprocess.call(user_input, shell=True)  # B602: subprocess_popen_with_shell_equals_true
    return eval(user_input)  # B307: use_of_eval
