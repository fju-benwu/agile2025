export default async function Page({ params }) {
  const { tid } = await params
  const tname = isNaN(Number(tid)) ? decodeURIComponent(tid) : tid;
  return <div>tname: {tname}</div>
}