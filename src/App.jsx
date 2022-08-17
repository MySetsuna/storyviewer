import React, { useContext, useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import md5 from "md5";
import VirtualTable from "./components/Table/VirtualTable";

const ThemeContext = React.createContext();
const UserContext = React.createContext();
function App() {
  const [useInfo, setUserInfo] = useState();
  const [themeInfo, setThemeInfo] = useState();
  useEffect(() => {
    const userInfo = localStorage.getItem("useInfo");
    const themeInfo = localStorage.getItem("themeInfo");
    !!themeInfo
      ? setThemeInfo(themeInfo)
      : setThemeInfo({
          sider: "light",
          mainEditor: "light",
          themeColor: "pink",
        });
    !!userInfo
      ? setUserInfo(userInfo)
      : setUserInfo({
          type: "guset",
          name: "游客",
          loginTime: new Date().getTime(),
        });
  }, []);
  return (
    <div className="App">
      <UserContext.Provider value={useInfo}>
        <ThemeContext.Provider value={themeInfo}>
          <div>
            <VirtualTable />
          </div>
          {/* <div>
            <ThemeContext.Consumer>{value => <div>主题：{JSON.stringify(value)}</div>}</ThemeContext.Consumer>
            <UserContext.Consumer>{value => <div>用户信息：{JSON.stringify(value)}</div>}</UserContext.Consumer>
          </div> */}
        </ThemeContext.Provider>
      </UserContext.Provider>
    </div>
  );
}

export default App;
