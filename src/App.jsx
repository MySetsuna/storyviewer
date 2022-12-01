import React, { useContext, useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import md5 from "md5";
import { VirtualTable } from "./components/VirtualTable";

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
            <VirtualTable
              rows={store.expandListData}
              fields={store.visibleAllFields}
              className={styles.tableBox}
              loading={store.loading}
              rowHeight={42}
              titleBackgroud="#17171a"
              resizeTrigger="move"
              emptyBox={
                <EmptyBox info="暂无数据" style={{ padding: "40px 0" }} />
              }
              emptyRow={
                <div
                  style={{
                    paddingLeft: 77,
                    minWidth: 200,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  暂无子需求/任务
                </div>
              }
              creatorRow={{
                ["story"]: <div>创建需求</div>,
                ["task"]: <div>创建任务</div>,
              }}
            />
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
