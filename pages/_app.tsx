import "tailwindcss/tailwind.css";
import { SWRConfig } from "swr";

const fetcher = (url: string, options: object) =>
  fetch(url, options).then((res) => res.json());

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
