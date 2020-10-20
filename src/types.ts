export interface Action<T = any> {
  type: T
}
export interface AnyAction extends Action {
  [extraProps: string]: any
}
export interface Dispatch<A extends Action = AnyAction> {
  <T extends A>(action: T): T
}
export interface Store<S = any, A extends Action = AnyAction> {
  dispatch: Dispatch<A>

  getState(): S

  subscribe(listener: () => void): any

  replaceReducer(nextReducer: any): void
}
