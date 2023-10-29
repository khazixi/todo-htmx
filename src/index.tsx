import { Fragment, type FC } from 'hono/jsx'
import type { Todo } from './schema'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { todo } from './schema'
import { db } from './db'

const app = new Hono()

const HTML: FC = (props) => {
  return (
    <html>
      <head>
        <title> TODO MVC with Hono </title>
        {
          /*
        <script src="https://unpkg.com/htmx.org@1.9.6" integrity="sha384-FhXw7b6AlE/jyjlZH5iHa/tTe9EpJ1Y55RjcgPbjeWMskSxZt1v9qkxLJWNJaGni" crossorigin="anonymous"></script>
           */
        }
      </head>
      <body>
        {props.children}
      </body>
    </html>
  )
}

const Block: FC = (props: { title: string, description: string }) => {
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
  <form method="post" action="/save">
    <label for="title"> Title </label>
    <input type="text" name="title" id="title" />
    <br />
    <label for="description"> Description </label>
    <input type="text" name="description" id="description" />
    <br />
    <input type="submit" />
  </form>
)

app.post('/save',
  validator('form', (value, c) => {
    const title = value['title']
    const description = value['description']
    if (typeof title === 'string' && typeof description === 'string') {
      return { title: title, description: description }
    }
    return c.text('Invalid Response', 400)
  }),
  async (c) => {
    const { title, description } = c.req.valid('form')

    try {
      await db
        .insert(todo)
        .values({
          title: title,
          description: description
        })
      return c.text('Created.', 201)
    } catch {
      return c.text('Failed to Create', 400)
    }
  }
)

app.get('/todos',
  async (c) => {
    const result = await db
      .select({
        title: todo.title,
        description: todo.description
      })
      .from(todo)

    return c.html(
      <Fragment>
        {
          result.map(v => <Block
            title={v.title}
            description={v.description}
          />)
        }
      </Fragment>
    )
  })

app.get('/', (c) => c.html(
  <HTML>
    <h1> HTML with proops </h1>
    <Adder />
  </HTML>
))

serve(app)
