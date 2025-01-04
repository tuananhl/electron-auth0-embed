import { Adapter, IContext, IOperation } from './types';

export function mergeAdapters(...adapters: Adapter[]): Adapter {
  return (config) => {
    return adapters.reduce((hashMap, adapter) => ({
      ...hashMap,
      ...adapter(config),
    }), {} as IContext)
  };
}

export function $applyContext(ctx: IContext) {
  return function <I, O>(op: IOperation<I, O>): I extends unknown ? () => O : (input: I) => O {
    return ((input: I) => op(ctx, input)) as any;
  }
}


export const context = <K extends keyof IContext>(contextKey: K, vl: IContext[K]) => ({
  [contextKey]: vl,
});
