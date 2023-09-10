import { WithAuthenticatorProps, withAuthenticator } from "@aws-amplify/ui-react"


function Authenticator({signOut, user} : WithAuthenticatorProps) {
  return (
    <>
    <h1>Hello {user?.username}</h1>
    <button onClick={signOut}>Sign out</button>
    </>
  )
}

export default withAuthenticator(Authenticator);