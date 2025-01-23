import NextErrorComponent from 'next/error'

const MyError = ({ statusCode }) => {
  return <NextErrorComponent statusCode={statusCode} />
}

MyError.getInitialProps = async ({ res, err }) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps({
    res,
    err,
  })

  return errorInitialProps
}

export default MyError
