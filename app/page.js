import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
  <div className={styles.page}>
    <main className={styles.main}>
    <h1>FJU Go Go</h1>
    <ul>
<<<<<<< HEAD
      <li>吳玟慧</li>
=======
      <li>吳濟聰</li>黎小雅
       <li>吳濟聰</li>
      <li>蔡政穎</li>
      <li>413085079李鎧任</li>
>>>>>>> e7c9811b9929e0bf9adcbf2ac6f0eb7e03c3cbbd
      <li><Link href="/test">Test</Link></li>
      <li><a href="http://www.im.fju.edu.tw">輔大資管</a></li>
    </ul>
    </main>
  </div>
  )
}