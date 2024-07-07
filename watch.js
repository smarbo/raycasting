const spawn = require("child_process").spawn;

function cmd(program, args) {
  console.log("CMD:", program, args);
  const p = spawn(program, args.flat());
  p.stdout.on("data", (data) => process.stdout.write(data));
  p.stderr.on("data", (data) => process.stderr.write(data));
  p.on("close", (code) => {
    if (code !== 0) {
      console.error(program, args, "exited with", code);
    }
  })
  return p;
}

cmd("tsc", ["-w"]);
cmd("http-server", ["-p", "6969", "-a", "127.0.0.1", "-s"]);
