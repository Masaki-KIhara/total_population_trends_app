import { ChangeEvent, ReactNode, useState } from "react";
import { useEffect } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type GetPrefectureType = { prefCode: number; prefName: string }[];

type PopulationLabelType = "総人口" | "年少人口" | "生産年齢人口" | "老年人口";

type GetPrefDataType = {
  boundaryYear: number;
  data: {
    label: PopulationLabelType;
    data: { year: number; value: number }[];
  }[];
};

//一つのline
type PopulationType = {
  prefCode: number;
  総人口: { year: number; value: number }[];
  年少人口: { year: number; value: number }[];
  生産年齢人口: { year: number; value: number }[];
  老年人口: { year: number; value: number }[];
}[];

type FetchPrefectureDataType<T> = {
  message: null;
  result: T;
};

const divideValue = (
  value: PopulationLabelType,
  target: {
    label: PopulationLabelType;
    data: { year: number; value: number }[];
  }
): { year: number; value: number }[] => {
  if (value === target.label) {
    return target.data;
  } else {
    return [];
  }
};

export default function Home() {
  const [prefData, setPrefData] = useState<GetPrefectureType>([]);
  const [population, setPopulation] = useState<PopulationType>([]);
  const [populationTypeValue, setPopulationTypeValue] = useState<string>("");
  const [selectedPrefs, setSelectedPrefs] = useState<{
    [key: number]: boolean;
  }>({});
  const searchPrefName = (prefCode: number) => {
    const test = prefData.filter((target) => target.prefCode === prefCode);
    return test[0].prefName;
  };

  const dividePopulationType = (
    value: string,
    item: {
      prefCode: number;
      総人口: { year: number; value: number }[];
      年少人口: { year: number; value: number }[];
      生産年齢人口: { year: number; value: number }[];
      老年人口: { year: number; value: number }[];
    }
  ) => {
    switch (value) {
      case "年少人口":
        return (
          <Line
            key={`${item.prefCode}-年少人口`}
            type="monotone"
            dataKey="value"
            data={item.年少人口}
            name={`${searchPrefName(item.prefCode)}`}
            stroke="#3C3C3C"
          />
        );
      case "生産年齢人口":
        return (
          <Line
            key={`${item.prefCode}-生産年齢人口`}
            type="monotone"
            dataKey="value"
            data={item.生産年齢人口}
            name={`${searchPrefName(item.prefCode)}`}
            stroke="#8C89D9"
          />
        );
      case "老年人口":
        return (
          <Line
            key={`${item.prefCode}-老年人口`}
            type="monotone"
            dataKey="value"
            data={item.老年人口}
            name={`${searchPrefName(item.prefCode)}`}
            stroke="#8884d8"
          />
        );
      default:
        return (
          <Line
            key={`${item.prefCode}-総人口`}
            type="monotone"
            dataKey="value"
            data={item.総人口}
            name={`${searchPrefName(item.prefCode)}`}
            stroke="#8884d8"
          />
        );
    }
  };

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
      .then((data: FetchPrefectureDataType<GetPrefDataType>) => {
        const newPopulation = data.result.data.map((item) => ({
          prefCode,
          総人口: divideValue("総人口", item),
          年少人口: divideValue("年少人口", item),
          生産年齢人口: divideValue("生産年齢人口", item),
          老年人口: divideValue("老年人口", item),
        }));
        setPopulation((prevPopulation) => [
          ...prevPopulation,
          ...newPopulation,
        ]);
      })
      .catch(() => console.log("エラー"));
  };

  const handleCheckboxChange = (prefCode: number) => {
    setSelectedPrefs((prevSelectedPrefs) => {
      const newSelectedPrefs = {
        ...prevSelectedPrefs,
        [prefCode]: !prevSelectedPrefs[prefCode],
      };

      if (newSelectedPrefs[prefCode]) {
        getPrefData(prefCode);
      } else {
        setPopulation((prevPopulation) =>
          prevPopulation.filter((pop) => pop.prefCode !== prefCode)
        );
      }

      return newSelectedPrefs;
    });
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
            checked={!!selectedPrefs[item.prefCode]}
            onChange={() => handleCheckboxChange(item.prefCode)}
          />
        </label>
      ))}
      <select
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          setPopulationTypeValue(e.target.value);
        }}
      >
        <option value={"総人口"}>総人口</option>
        <option value={"年少人口"}>年少人口</option>
        <option value={"生産年齢人口"}>生産年齢人口</option>
        <option value={"老年人口"}>老年人口</option>
      </select>
      <ResponsiveContainer width={700} height={300}>
        <LineChart width={500} height={300} data={population}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" padding={{ left: 30, right: 30 }} />
          <YAxis dataKey={"value"} />
          <Tooltip />
          <Legend />
          {population.map((item) =>
            dividePopulationType(populationTypeValue, item)
          )}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
