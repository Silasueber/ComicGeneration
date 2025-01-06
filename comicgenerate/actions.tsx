"use server";

export async function addComment() {
  const response = await fetch(`http://127.0.0.1`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  console.log(result);
  return result;
}
