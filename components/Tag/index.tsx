import classNames from "classnames";
import { FC } from "react";

type Prop = {
  name: string,
  type: string,
  className?: string,
  size?: 'sm' | 'md' | 'lg'
}
const Tag: FC<Prop> = ({name, type, className, size}) => {
  return (<span className={classNames(" rounded-md text-white px-1 py-0.5 text-sm border-blue-600", getColorClassName(type), className)}>{name}</span>);
}

function getColorClassName(type: string){
  return "bg-blue-500"
}

export default Tag;