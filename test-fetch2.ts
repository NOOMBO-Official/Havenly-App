async function test() {
  const res = await fetch("http://localhost:3000/api/test-env");
  const text = await res.text();
  console.log(text);
}
test();
