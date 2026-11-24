# Future improvements

Persistent register of approved deferred work, not authorization to implement.

## FI-001 - Remove legacy interview_priority

Status: Planned / Deferred. Outside current mandatory implementation scope.
Remove ambiguous legacy field after transition to priority; preserve raw values meanwhile.
Preconditions: audit usages, assess retention/conversion needs, separate owner approval.
Completion: remove legacy DB field, DTO/API/export references and compatibility paths
in a separately approved task with forward migration. No historical migration edits.
See [decision register](card-classification/DECISIONS.md). No other ideas added.
