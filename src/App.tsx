import React, {Key, ReactText} from 'react';
import {DownOutlined, ReadOutlined, SearchOutlined} from "@ant-design/icons";
import {Tree} from "antd";
import 'antd/dist/antd.css';

const App = () => {
  const treeData = [
    {
      title: "Read",
      key: '0-0',
      icon: <ReadOutlined />,
      children: [
        {
          title: (<span style={{fontWeight: "bold"}}>In this section, you can search read the full Bible, or you can just read selected passages from the Bible.</span>),
          key: '0-0-0',
          selectable: false
        },
        {
          title: 'Read Chapter',
          key: '0-0-1',
        },
        {
          title: 'Browse',
          key: '0-0-2',
        },
      ],
    },
    {
      title: 'Search',
      key: '0-1',
      icon: <SearchOutlined />,
      children: [
        {
          title: (<span style={{fontWeight: "bold"}}>In this section, you can search the full bible for any word or phrase, including wildcards. The search can be performed in the Old Testament, New Testament or the Full Bible, or you can limit the search to a particular book of the Bible. Additionally, you can search any of the supported translations of the Bible.</span>),
          key: '0-1-0',
          selectable: false
        },
        {
          title: 'Search Full Bible',
          key: '0-1-1',
        },
        {
          title: 'Browse',
          key: '0-1-2',
        },
      ],
    },
  ];
  const handleExpand = (expandedKeys: ReactText[], info: {expanded: any, node: any}) => {
    console.log('handleExpand - expandedKeys:');
    console.log(expandedKeys);
    console.log('expanded:');
    console.log(info.expanded);
    console.log('node:');
    console.log(info.node);
  };
  const handleSelect = (selectedKeys: Key[]) => {
    console.log("handleSelect - selectedKeys:");
    console.log(selectedKeys);
  };
  return (
      <Tree
          showIcon
          switcherIcon={<DownOutlined />}
          treeData={treeData}
          onExpand={handleExpand}
          onSelect={handleSelect}
      />
  );
}

export default App;
