#!/bin/bash

# Fix all test files with it.todo() that have expect.fail() in them
# by removing the function body to make them proper placeholders

for file in src/lib/design-system/organisms/*.test.ts \
           src/lib/design-system/templates/*.test.ts \
           src/lib/design-system/molecules/*.test.ts \
           src/lib/design-system/atoms/*.test.ts \
           src/lib/meili/utils/*.test.ts \
           src/lib/features/settings/*.test.ts \
           tests/integration/*.test.ts; do
  if [ -f "$file" ]; then
    # Replace it.todo('description', () => { ... }); with it.todo('description');
    perl -i -0pe "s/it\.todo\(([^)]+)\), \(\) => \{[^}]*expect\.fail[^}]*\}\)/it.todo(\1)/gs" "$file"
  fi
done

echo "Fixed all it.todo() test placeholders"