import console from "console";
import clc from "cli-color";

const logger = {
  information: (...args) => console.log(clc.blue.bold(...args)),
  error: (...args) => console.error(clc.red.bold(...args)),
  success: (...args) => console.log(clc.green.bold(...args)),
  warning: (...args) => console.warn(clc.yellow.bold(...args)),
};
export default logger;
