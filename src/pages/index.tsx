import { useState } from "react";
import { useEffect } from "react";

type GetPrefectureType = { prefCode: number; prefName: string }[];

type FetchPrefectureDataType<T> = {
  message: null;
  result: T;
};

export default function Home() {
  const [prefData, setPrefData] = useState<GetPrefectureType>([]);
  const getPrefectureData = () => {
    fetch("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_RESAS_API_KYE as string,
      },
    })
      .then((res) => res.json())
      .then((data: FetchPrefectureDataType<GetPrefectureType>) =>
        setPrefData(data.result)
      )
      .catch(() => {
        console.log("エラー");
      });
  };

  const getPrefData = (prefCode: number) => {
    fetch(
      `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=11362&prefCode=${prefCode}`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_RESAS_API_KYE as string,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => console.log(data));
  };

  useEffect(() => {
    getPrefectureData();
  }, []);

  return (
    <>
      {prefData.map((item) => (
        <label key={item.prefCode}>
          {item.prefName}
          <input
            type={"checkbox"}
            value={item.prefCode}
            onChange={() => {
              getPrefData(item.prefCode);
            }}
          />
        </label>
      ))}
    </>
  );
}
