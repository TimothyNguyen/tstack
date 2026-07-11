# Google ADK Adapter Notes

Google ADK is an optional integration target. It must not become a hard
dependency of `core/`.

## Observed Surface

The adapter should account for these ADK concepts:

```python
from google.adk.agents import Agent
from google.adk.tools.tool_context import ToolContext
from google.adk.callbacks import CallbackContext
from google.adk.models.llm import LlmRequest
from google.genai import types
```

The ADK shape is agent-centric:

- An `Agent` has a name, model, instructions, and tools.
- Tools are ordinary callable functions with structured inputs and outputs.
- `ToolContext` can carry execution context for tool calls.
- `CallbackContext` can support lifecycle hooks.
- `LlmRequest` and `google.genai.types` are the likely bridge for model request
  shaping and structured content.

## Adapter Boundary

The core architecture should expose a host-neutral skill invocation contract.
The Google ADK adapter maps that contract into ADK agents, tools, callbacks, and
model requests.

```text
skill source
  -> skill compiler
  -> generated host artifact
  -> google-adk adapter
  -> Agent(instruction, tools, callbacks)
```

## Tool Requirements

ADK tools should remain explicit and policy-bound.

Example tool categories:

- Read-only project inspection.
- Ticket creation.
- Human escalation.
- Test execution.
- Codebase understanding lookup.
- Policy-approved database read.

Default-disabled tool categories:

- Shell write.
- Git write.
- Deployment.
- Credential access.
- Cookie/session import.
- Public network scraping.
- Database write.

## State Requirements

ADK instructions may reference state, such as customer or support history. The
adapter must treat state access as a policy-governed data read.

State rules:

- Skills must declare required state paths.
- Sensitive state must not be copied into audit logs.
- Missing state must produce a graceful fallback.
- Project profiles decide which state paths are available.

## Callback Requirements

Callbacks are the right place to enforce enterprise controls around ADK
execution:

- Before model request: attach policy context and redact disallowed state.
- Before tool call: check tool allowlist and required approval.
- After tool call: emit local audit event without secrets.
- On escalation: record reason, target queue, and correlation id.

## Example Domain Mapping

A technical support ADK agent maps to this architecture as:

| ADK element | Architecture element |
|---|---|
| `Agent(name=...)` | Host-generated agent artifact |
| `instruction=...` | Compiled skill instruction |
| `troubleshoot_issue` | Policy-bound tool |
| `create_ticket` | Policy-bound integration tool |
| `escalate_to_human` | Human escalation tool |
| `state["customer_info"]` | Declared state dependency |
| `CallbackContext` | Audit and policy enforcement hook |

This same pattern should work for software-engineering skills, marketing
measurement workflows, and future business-app agents.
