import re

def refactor_file(file_path):
    with open(file_path, "r") as f:
        content = f.read()

    # Determine if createSession is needed
    needs_session = True # Just always include it for safety in tests

    # Add correct imports
    imports = 'import { createTestCaller, createSession, type AppCaller } from "./setup-trpc";\n'

    content = re.sub(r'import { createTestCaller.*?setup-trpc";\n', '', content)

    # Check if we removed `import { createCaller }` from linkRouter but didn't replace it
    if "linkRouter.spec.ts" in file_path:
        # LinkRouter actually uses createTRPCContext and createCaller directly in beforeEach, not createTestCaller!
        # Re-inject it for now.
        content = 'import { createCaller } from "@/server/api/root";\n' + content

    content = imports + content

    with open(file_path, "w") as f:
        f.write(content)


for file in [
    "src/test/userRouter.spec.ts",
    "src/test/collectionRouter.spec.ts",
    "src/test/linkRouter.spec.ts",
    "src/test/catalogSecurity.spec.ts",
    "src/test/linkSecurity.spec.ts"
]:
    refactor_file(file)
