let count = 0
const run = () => {
  setTimeout(() => {
    count++
    console.log(count)
    run()
  }, 200)
}
run()
