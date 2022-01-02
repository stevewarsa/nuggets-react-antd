import axios from "axios";

class MemoryService {
    public getMemoryPsgList() {
        return axios.get("/nuggets/server/get_mempsg_list.php?user=SteveWarsa");
    }
}
export default new MemoryService();
