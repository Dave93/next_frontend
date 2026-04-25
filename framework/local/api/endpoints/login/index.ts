// noop placeholder, returns valid handler matching ApiRouteConfig
export default function noopApi(
  ..._args: unknown[]
): (req: unknown, res: unknown) => unknown {
  return () => undefined
}
