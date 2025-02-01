function welcome(name: string) {
  console.log('Welcom ' + name)

  const user = {
    name: 'Test',
  }

  const fname = user.name

  return name + fname
}

welcome('Test')
