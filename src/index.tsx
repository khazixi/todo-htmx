import type { FC } from 'hono/jsx'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

const HTML: FC = (props) => {
  return (
    <html>
      <head>
        <title> TODO MVC with Hono </title>
        <script src="https://unpkg.com/htmx.org@1.9.6" integrity="sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni" crossorigin="anonymous"></script>
      </head>
      <body>
        {props.children}
      </body>
    </html>
  )
}

const Todo: FC = () => {
  return (
    <div>
      <h2> Todo Title </h2>
      <p> Todo Content </p>
      <button> Delete </button>
      <button> Edit </button>
    </div>
  )
}

const Adder: FC = () => (
  <form method="POST" action="/save">
    <label> Add Your Todo </label>
    <br/>
    <input type="text" />
    <br/>
    <button type="submit"> This is a submissions button </button>
  </form>
)

app.get('/', (c) => c.html(
  <HTML>
    <h1> HTML with proops </h1>
    <Adder />
    <Todo />
  </HTML>
))

serve(app)
