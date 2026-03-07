async function test() {
  const res = await fetch("http://localhost:3000/api/test-chat");
  const text = await res.text();
  console.log(text);
}
test();
