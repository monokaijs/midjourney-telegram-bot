import Head from 'next/head'
import styles from '@/styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>MidJourney Telegram Bot Tutorial</title>
        <meta name="author" content="monokaijs" />
        <meta name="description" content="MidJourney Telegram Bot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <p>
          Hello there. Your bot does not works? Visit <a href={'/api/telegram-webhook'}>this page</a> to complete setup.
        </p>
      </main>
    </>
  )
}
