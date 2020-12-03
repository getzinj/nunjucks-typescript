export function isMainModule(): boolean {
  // generate a stack trace
  const stack: string = (new Error()).stack;
  // the third line refers to our caller
  const stackLine: string = stack.split('\n')[2];
  // extract the module name from that line
  const callerModuleName: string = /\((.*):\d+:\d+\)$/.exec(stackLine)[1];

  return require.main.filename === callerModuleName;
}

