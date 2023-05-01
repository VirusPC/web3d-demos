
export type BooleanController = {
  type: "boolean",
  label: string,
  default: boolan,
  callback: (value: boolean) =>  void;
}
export type NumberController = {
  type: "number",
  label: string,
  range: number[],
  default: number,
  step?: number,
  callback: (value: number|null) =>  void;
}
export type RadioController = {
  type: "radio"
  label: string,
  options: {label: string, value: string}[]
  default: string,
  callback: (values: string) =>void
}
export type CheckboxController = {
  type: "checkbox"
  label: string,
  options: {label: string, value: string}[]
  default: string[],
  callback: (values: string[]) =>void
}
export type Controller = NumberController | BooleanController | RadioController | CheckboxController;
