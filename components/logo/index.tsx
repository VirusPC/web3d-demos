import styles from "./index.module.scss";
import Link from "next/link";
// import classNames from "classnames";

// type Props = {
//   size?: 'sm' | 'md' | 'lg'
// }
export default function Logo({ size = 'md' }) {
  return <Link href="/" className={`-m-1.5 p-1.5 text-center flex items-end`}>
    <span className={styles["cloud"]}>
      <span className={` text-lg ${styles["text3d"]}`}>Web 3D </span>
      &nbsp;
      <span className=''>Demos</span>
    </span>
  </Link>
}