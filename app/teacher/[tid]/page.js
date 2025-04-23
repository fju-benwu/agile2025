
export async function generateStaticParams() {
  // Replace with your actual dynamic parameters
  return [
    { tid: '1' },
    { tid: '2' },
    { tid: 'example' },
  ];
}

export default async function Page({ params }) {
  const { tid } = params;
  const tname = isNaN(Number(tid)) ? decodeURIComponent(tid) : tid;
  return <div>tname: {tname}</div>;
}