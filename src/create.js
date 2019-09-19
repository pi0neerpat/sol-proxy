'use strict';

const fs = require('fs');
const parser = require('solidity-parser-antlr');
const colors = require('colors');
import prettier from 'prettier/standalone';
const prettierSolidity = require('prettier-plugin-solidity');

const CONTRACT_NAME = '\n\ncontract Storage';
const STORAGE_WARNING =
  '\n/* WARNING: NEVER RE-ORDER VARIABLES! Always double-check that new variables are added APPEND-ONLY. Re-ordering variables can permanently BREAK your deployed proxy contract.*/';

export function create(file) {
  let pragma_output = '';
  let imports_output = '';
  let bases_output = [];
  let structs_output = '';
  let variables_output = '';

  const content = fs.readFileSync(file).toString('utf-8');
  const ast = parser.parse(content);
  parser.visit(ast, {
    // Get all import statements for userDefinedVariables
    PragmaDirective(node) {
      // console.log(`${node.type} ${node.name} ${node.value};`);
      pragma_output += `pragma ${node.name} ${node.value};\n`;
    },

    ImportDirective(node) {
      const imports = node.symbolAliases.map(alias => {
        return alias[0];
      });
      console.log(`import {${imports}} from "${node.path}";`);
      imports_output += `\nimport {${imports}} from "${node.path}";`;
    },

    ContractDefinition(node) {
      const name = node.name;
      node.baseContracts.forEach(spec => {
        bases_output.push(spec.baseName.namePath);
      });
      // console.log(` + ${specs} ${name} ${bases}`);
    },

    EventDefinition(node) {
      // console.log(node);
    },

    StructDefinition(node) {
      const name = node.name;
      let members = '';
      node.members.forEach(member => {
        members += `\n${getType(member.typeName)} ${member.name};`;
      });
      // console.log(`struct ${name} {${members}\n}`);
      structs_output += `\n\nstruct ${name} {${members}\n}`;
    },

    StateVariableDeclaration(node) {
      const variable = node.variables[0];
      const type = getType(variable.typeName);
      let constant = '';
      if (variable.isDeclaredConst) constant = 'constant ';
      let visibility = variable.visibility;
      if (visibility === 'default') visibility = 'public';
      const name = variable.name;
      const typeName = variable.typeName.type;
      let expression = ';';
      if (variable.expression !== null) {
        expression = ` = ${getExpression(variable.expression)};`;
      }
      // console.log(`${type} ${constant}${visibility} ${name}${expression}`);
      variables_output += `\n${type} ${constant}${visibility} ${name}${expression}`;
    }
  });

  const rawContract = `${pragma_output}${imports_output}${CONTRACT_NAME} is ${bases_output} {${structs_output}\n${STORAGE_WARNING}${variables_output}\n}`;

  const prettyContract = prettier.format(rawContract, {
    parser: 'solidity-parse',
    plugins: [prettierSolidity]
  });

  fs.writeFile('./contracts/Storage.sol', prettyContract, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('\nSuccessfully created "Storage.sol"\n');
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

const getType = typeName => {
  if (
    typeName.type === 'ElementaryTypeName' ||
    typeName.type === 'UserDefinedTypeName'
  ) {
    return typeName[Object.keys(typeName)[1]];
  } else if (typeName.type === 'Mapping') {
    return `mapping(${getType(typeName.keyType)} => ${getType(
      typeName.valueType
    )})`;
  } else if (typeName.type === 'ArrayTypeName') {
    const length =
      typeName.length !== null ? getExpression(typeName.length) : '';
    return `${getType(typeName.baseTypeName)}[${length}]`;
  }
  return 'ERROR';
};
