import React, { useEffect, useState } from "react";
import {
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import axios from "axios";

const App = () => {
    const [calls, setCalls] = useState([]);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");

    useEffect(() => {
        axios.get("http://localhost:5000/calls").then((response) => {
            setCalls(response.data);
        });
    }, []);

    const handleSearch = (e) => setSearch(e.target.value);

    const handleSort = (order) => {
        const sortedCalls = [...calls].sort((a, b) =>
            order === "asc"
                ? a.agent.localeCompare(b.agent)
                : b.agent.localeCompare(a.agent)
        );
        setSortOrder(order);
        setCalls(sortedCalls);
    };

    const downloadCSV = () => {
        const csvData = [
            ["Call ID", "Agent", "Call Duration", "Call Silent Time", "Team", "QA Score"],
            ...calls.map((call) => [
                call.id,
                call.agent,
                call.audio_length,
                call.speech.reduce(
                    (total, interval) => total + (interval.end - interval.start),
                    0
                ),
                call.team,
                call.qa,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csvData], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "calls.csv";
        link.click();
    };

    const filteredCalls = calls.filter(
        (call) =>
            call.agent.toLowerCase().includes(search.toLowerCase()) ||
            call.team.toLowerCase().includes(search.toLowerCase()) 
    );

    return (
        <div>
            <h1>Call Data</h1>
            <TextField
                label="Search by Agent or Team"
                variant="outlined"
                value={search}
                onChange={handleSearch}
                style={{ marginBottom: 20 }}
            />
            <FormControl style={{ marginBottom: 20, marginLeft: 20 }}>
                <InputLabel>Sort by Agent</InputLabel>
                <Select value={sortOrder} onChange={(e) => handleSort(e.target.value)}>
                    <MenuItem value="asc">Ascending</MenuItem>
                    <MenuItem value="desc">Descending</MenuItem>
                </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={downloadCSV}>
                Download CSV
            </Button>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Call ID</TableCell>
                            <TableCell>Agent</TableCell>
                            <TableCell>Call Duration</TableCell>
                            <TableCell>Call Silent Time</TableCell>
                            <TableCell>Team</TableCell>
                            <TableCell>QA Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCalls.length > 0 ? (
                            filteredCalls.map((call) => (
                                <TableRow key={call.id}>
                                    <TableCell>{call.id}</TableCell>
                                    <TableCell>{call.agent}</TableCell>
                                    <TableCell>{call.audio_length}</TableCell>
                                    <TableCell>
                                        {call.speech.reduce(
                                            (total, interval) => total + (interval.end - interval.start),
                                            0
                                        )}
                                    </TableCell>
                                    <TableCell>{call.team}</TableCell>
                                    <TableCell>{call.qa}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No calls found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default App;
