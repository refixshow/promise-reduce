interface GenericObject {
  [key: string]: any;
}
interface IResolved {
  data: null | GenericObject;
  message: string;
  err: null | Error;
}
type TOutput = Array<IResolved>;
type TListOfPromises<T> = Array<() => Promise<T>>;
type TOnLoadCb<T = void> = (result: GenericObject, index: number) => T;

const asyncReduce = async <T = any>(
  listOfPromises: TListOfPromises<T> = [],
  onLoadCb?: TOnLoadCb,
  initialValue: TOutput = []
) => {
  return await listOfPromises.reduce(async (prev, promise, currIdx) => {
    const output = await prev;

    // to refactor?
    const fixedPromise = promise()["then"]
      ? promise
      : () => Promise.resolve(promise);

    const resolved: IResolved = {
      data: null,
      message: "",
      err: null,
    };

    try {
      resolved.data = await fixedPromise();
      resolved.message = "OK";
    } catch (err) {
      resolved.data = null;
      resolved.message = err.message;
      resolved.err = err;
    } finally {
      output.push(resolved);
      onLoadCb && onLoadCb(resolved, currIdx);
    }
    return output;
  }, Promise.resolve(initialValue));
};
