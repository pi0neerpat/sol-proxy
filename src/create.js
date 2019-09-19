'use strict';

const fs = require('fs');
const parser = require('solidity-parser-antlr');
const colors = require('colors');
const solpp = require('solpp');

export function create(file) {
  const content = fs.readFileSync(file).toString('utf-8');
  const PROCESSED_CODE = solpp
    .processCode(
      // The raw code to process.
      content,
      // Options object. All fields are optional.
      {
        // Don't flatten/inline imports. Defaults to false.
        noFlatten: false,
        // Disable the preprocessor. Defaults to false.
        noPreprocessor: false
      }
    )
    .then(res => {
      // console.log(res);
      const ast = parser.parse(content);

      parser.visit(ast, {
        ContractDefinition(node) {
          const name = node.name;
          let bases = node.baseContracts
            .map(spec => {
              return spec.baseName.namePath;
            })
            .join(', ');

          bases = bases.length ? `(${bases})`.gray : '';

          let specs = '';
          if (node.kind === 'library') {
            specs += '[Lib]'.yellow;
          } else if (node.kind === 'interface') {
            specs += '[Int]'.blue;
          }

          console.log(` + ${specs} ${name} ${bases}`);
        },

        'ContractDefinition:exit': function(node) {
          console.log('');
        },

        StateVariableDeclaration(node) {
          const type =
            node.variables[0].typeName[
              Object.keys(node.variables[0].typeName)[1]
            ];
          let constant = '';
          if (node.variables[0].isDeclaredConst) constant = 'constant ';
          const visibility = node.variables[0].visibility;
          const name = node.variables[0].name;
          const typeName = node.variables[0].typeName.type;
          // if typeof type === 'object'

          const exp = node.variables[0].expression;
          let expression = ';';
          if (exp !== null) {
            expression = ` = ${getExpression(exp)};`;
          }

          console.log(`${type} ${constant}${visibility} ${name}${expression}`);
          // console.log(node.variables[0]);
        }
      });
    });
}

const getLiteral = obj => {
  let value = 'ERROR';
  if (obj.type.indexOf('Literal') >= 0) {
    value = obj[Object.keys(obj)[1]];
    if (obj.type.indexOf('String') >= 0) {
      value = `"${value}"`;
    }
  }
  return value;
};

const getExpression = exp => {
  let value = 'ERROR';
  if (exp.type.indexOf('Literal') >= 0) {
    return getLiteral(exp);
  } else if (exp.type.indexOf('ElementaryTypeName') >= 0) {
    return exp.typeName.name;
  } else if (exp.type.indexOf('BinaryOperation') >= 0) {
    return `${getLiteral(exp.left)} ${exp.operator} ${getLiteral(exp.right)}`;
  } else if (exp.type.indexOf('UnaryOperation') >= 0) {
    const subExpression = getExpression(exp.subExpression);
    if (exp.isPrefix) {
      return `${exp.operator}${subExpression}`;
    }
    return `${subExpression}${exp.operator}`;
  } else if (exp.type.indexOf('FunctionCall') >= 0) {
    const func = getExpression(exp.expression);
    const args = exp.arguments.map(arg => {
      return getExpression(arg);
    });
    return `${func}(${args})`;
  }
};
