module.exports = {
    "extends": "standard",
    "rules": {
      "require-jsdoc": ["error", {
        "require": {
            "FunctionDeclaration": true,
            "MethodDefinition": false,
            "ClassDeclaration": false,
            "ArrowFunctionExpression": true,
            "FunctionExpression": false
        }
      }]
    }
};
