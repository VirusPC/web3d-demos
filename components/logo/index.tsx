import styles from "./index.module.scss";

export default function Logo() {
  return <a href="#" className="-m-1.5 p-1.5 text-center flex items-end">
    <span className={` text-lg ${styles["text3d"]}`}>Web 3D </span>
    &nbsp;
    <span className='text-sm'>Demos</span>
  </a>
}