import {ESLintUtils, TSESTree} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
    name => `https://example.com/rule/${name}`
);

type MessageIds = 'nonCompliantServiceUsage';

export default createRule<[], MessageIds>({
    name: 'react-hook-service-compliance',
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce use of standardized TypeScript service modules in React hooks'
        },
        messages: {
            nonCompliantServiceUsage: 'React hooks must use standardized TypeScript service modules.'
        },
        schema: []
    },
    defaultOptions: [],
    create(context) {
        // Collect imported service module names from standardized paths
        const serviceModuleImports = new Set<string>();

        return {
            ImportDeclaration(node: TSESTree.ImportDeclaration) {
                const importPath = node.source.value;
                if (typeof importPath === 'string' && importPath.includes('services')) {
                    for (const specifier of node.specifiers) {
                        if (specifier.type === 'ImportSpecifier' || specifier.type === 'ImportDefaultSpecifier') {
                            serviceModuleImports.add(specifier.local.name);
                        }
                    }
                }
            },
            CallExpression(node: TSESTree.CallExpression) {
                // Check if this is a React hook call (starts with "use")
                if (
                    node.callee.type === 'Identifier' &&
                    node.callee.name.startsWith('use')
                ) {
                    // Check arguments for usage of non-standard service modules
                    // For simplicity, check if any argument is an Identifier not in serviceModuleImports
                    for (const arg of node.arguments) {
                        if (arg.type === 'Identifier' && !serviceModuleImports.has(arg.name)) {
                            context.report({
                                node: arg,
                                messageId: 'nonCompliantServiceUsage'
                            });
                        }
                    }
                }
            }
        };
    }
});
