# Runtime Data Validation (Strict)

To ensure robustness, always use strict type checks based on the variable's initialization state.

### 1. String Validation
- **Do NOT** use: `if (str)` or `if (!str)`
- **MUST use**: `if (str !== '')` (Check against initialized empty string)

### 2. Number Validation
- **Do NOT** use: `if (num)`
- **MUST use**: `if (typeof num === 'number')` or `if (num !== 0)` (if 0 is invalid) or `if (Number.isFinite(num))`

### 3. Object Validation
- **Do NOT** use: `if (obj)`
- **MUST use**: `if (typeof obj === 'object' && obj !== null)`
- **Strict Class Check**: `if (obj instanceof MyClass)` (when validating specific class instances)

### 4. Array Validation
- **Do NOT** use: `if (arr)`
- **MUST use**: `if (Array.isArray(arr) && arr.length > 0)`

### 5. Strict Equality
- **ALWAYS** use `===` and `!==`.
- **NEVER** use `==` or `!=`.
