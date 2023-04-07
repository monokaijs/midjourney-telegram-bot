import Head from 'next/head'

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
      <main>
        <p>
          Hello there. Your bot does not work? Visit <a href={'/api/telegram-webhook'}>this page</a> to complete setup.
        </p>
      </main>
    </>
  )
}
