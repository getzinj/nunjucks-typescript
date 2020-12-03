// Print the AST in a nicely formatted tree format for debugging
import { NunjucksNode } from '../nodes/nunjucksNode';
import { CallExtension } from '../nodes/callExtension';
import { NunjucksNodeList } from '../nodes/nunjucksNodeList';
import { INunjucksNode } from '../nodes/INunjucksNode';


// This is hacky, but this is just a debugging function anyway
function print(str: string, indent?: number, inline?: boolean): void {
  const lines: string[] = str.split('\n');

  lines.forEach((line: string, i: number): void => {
    if (line && ((inline && i > 0) || !inline)) {
      process.stdout.write((' ').repeat(indent));
    }
    const nl: string = (i === lines.length - 1) ? '' : '\n';
    process.stdout.write(`${line}${nl}`);
  });
}


export function printNodes(node: INunjucksNode, indent: number): void {
  indent = indent || 0;

  print(node.typename + ': ', indent);

  if (node instanceof NunjucksNodeList) {
    print('\n');
    node.children.forEach((n: NunjucksNode): void => {
      printNodes(n, indent + 2);
    });
  } else if (node instanceof CallExtension) {
    print(`${node.extName}.${node.prop}\n`);

    if (node.args) {
      printNodes(node.args, indent + 2);
    }

    if (node.contentArgs) {
      node.contentArgs.forEach((n: NunjucksNode): void => {
        printNodes(n, indent + 2);
      });
    }
  } else {
    const nodes: [string | number, any][] = [];
    let props: Record<string | number, any> = null;

    node.iterFields((val, fieldName: string | number): void => {
      if (val instanceof NunjucksNode) {
        nodes.push([ fieldName, val ]);
      } else {
        props = props ?? {};
        props[fieldName] = val;
      }
    });

    if (props) {
      print(JSON.stringify(props, null, 2) + '\n', null, true);
    } else {
      print('\n');
    }

    nodes.forEach(([ fieldName, n ]): void => {
      print(`[${fieldName}] =>`, indent + 2);
      printNodes(n, indent + 4);
    });
  }
}
