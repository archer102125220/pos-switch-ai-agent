# No Scripts for Code Refactoring

## Rule

**ABSOLUTELY FORBIDDEN: Using any automated scripts (sed, awk, powershell script, batch script, etc.) to directly modify code files.**

## Reason

**Incident on 2026-01-23:**
- Used `sed` script to batch replace `React.FormEvent` → `FormEvent` and `React.ReactNode` → `ReactNode`
- Script only changed type names, **failed to add required import statements**
- Caused compilation errors in multiple files
- Required manual fix of all affected files one by one

## Allowed Approaches

✅ **Manual modification using AI tools**
- `replace_file_content` - for single contiguous edits
- `multi_replace_file_content` - for multiple non-contiguous edits
- **MUST verify import statements are correct** for every change

## Forbidden Approaches

❌ **Any form of script-based batch modification**
- `sed`
- `awk`
- `powershell -Command`
- `find ... -exec`
- Any text processing tool's batch replacement features

## Exception Process

If script usage is **absolutely necessary**:

1. **MUST obtain explicit human developer approval first**
2. Must provide complete script content for review
3. Must explain why manual tools cannot accomplish the task
4. Only execute after developer approval

## Consequences for Violation

Violation is considered a **CRITICAL ERROR** and requires:
1. Immediately stop all work
2. Manually fix all affected files
3. Verify all modifications are correct
4. Clearly document error cause and fix in commit message

## Remember

**Scripts are blind. AI should be intelligent.**

Code modification requires understanding context, import dependencies, type systems, etc. These are beyond what scripts can handle.

---

**Created**: 2026-01-23  
**Trigger Event**: Bearer Token type refactoring incident
