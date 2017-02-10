import * as _ from 'highland';
import { Cursor } from 'mongodb';

export default function process(config: {
  src: NodeJS.ReadableStream | Cursor<any>,
  doto?: (doc: any) => any,
  filter?: (doc: any) => boolean,
  map?: (doc: any, cb: (err: Error, res?: any) => void) => void,
  limit?: number,
  errors?: (err: Error) => void,
  each?: (result: any) => void
}, cb: () => void) {

  // Setup pipeline
  let pipeline: any = _(config.src);
  if (config.doto) { pipeline = pipeline.doto(config.doto); }
  if (config.filter) { pipeline = pipeline.filter(config.filter); }
  if (config.map) {
    if (config.limit) {
      pipeline = pipeline.map(_.wrapCallback(config.map)).mergeWithLimit(config.limit);
    } else {
      pipeline = pipeline.map(_.wrapCallback(config.map)).merge();
    }
  }
  if (config.errors) { pipeline = pipeline.errors(config.errors); }

  // Consume
  if (config.each) {
    pipeline.each(config.each).done(cb);
  } else {
    pipeline.done(cb);
  }
}
