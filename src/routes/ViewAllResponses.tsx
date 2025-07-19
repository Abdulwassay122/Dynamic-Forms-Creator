import { AuthContext } from "@/context/myContext"
import { Fragment, useContext, useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import spinner from './Iphone-spinner-2 (2).gif'
import wrong from './wrong.png'
import Select from 'react-select'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminViewAllUsers } from "@/components/admin-components/admin-view-all-users"

export default function ViewAllResponses() {
    // Check User or Admin
    const { user } = useContext<any>(AuthContext)
    const isAdmin = user.role === "admin"
    if (isAdmin) {
        return (
            <div className="px-4 lg:px-6 py-10">
                <AdminViewAllUsers />
            </div>)
    } else {
        const apiUrl = import.meta.env.VITE_API_URL;
        const navigate = useNavigate()
        const { userId } = useContext<any>(AuthContext)
        const [formData, setFormData] = useState<any[]>([])
        const [loading, setLoading] = useState<boolean>(true)
        const [input, setInput] = useState<string[]>([]);
        const [filteredFormData, setFilteredFormData] = useState<any[]>([]);
        const [Error, setError] = useState<boolean>(false);
        const [currentPage, setCurrentPage] = useState(1);

        // fro pagination  
        const itemsPerPage = 10;
        const flatResponses = filteredFormData.flatMap((form: any) =>
            form.responses.map((response: any, idx: number) => ({
                ...response,
                formTitle: form.title,
                formId: form.id,
                responseIndex: idx + 1,
            }))
        );
        console.log('flatresponse', flatResponses)
        const totalPages = Math.ceil(flatResponses.length / itemsPerPage);
        const paginatedResponses = flatResponses.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        useEffect(() => {
            setCurrentPage(1)
        }, [input, formData])

        const handleChange = (selectedOptions: any) => {
            const values = selectedOptions.map((option: any) => option.value);
            setInput(values);
        };

        // option for multi sleect2 
        const options = formData.map(item => ({
            value: item.title,
            label: item.title.charAt(0).toUpperCase() + item.title.slice(1)
        }));

        useEffect(() => {
            async function fetchApi() {
                try {
                    const data = await fetch(`${apiUrl}/getformbyuserid?userId=${userId}`)
                    const parData = await data.json()
                    const forms = parData.forms

                    const formsWithResponses = await Promise.all(
                        forms.map(async (form: any) => {
                            const res = await fetch(`${apiUrl}/submitform?formId=${form.id}`)
                            const resData = await res.json()
                            return {
                                ...form,
                                responses: resData.forms || []
                            }
                        })
                    )

                    setFormData(formsWithResponses)
                    setLoading(false)

                } catch (error: any) {
                    console.log("Error: ", error.message)
                    setLoading(false)
                    setError(true)
                }
            }
            fetchApi()

        }, [userId])

        useEffect(() => {
            if (input?.length > 0) {
                const filtered = formData.filter((item) =>
                    input.some((val) =>
                        item?.title?.toLowerCase().includes(val.toLowerCase())
                    )
                );

                setFilteredFormData(filtered);
            } else {
                setFilteredFormData(formData);
            }
        }, [input, formData]);

        console.log("Inp", input)
        console.log(formData)
        function handleClick(formId: any, responseId: any) {
            navigate(`/seeformresponse?formId=${formId}&responseId=${responseId}`)
        }

        return (
            <div className="px-4 lg:px-6 sm:py-10 py-2  flex flex-col gap-10">
                <div className="relative flex items-center">
                    <Select
                        isMulti
                        name="colors"
                        options={options}
                        className="basic-multi-select w-full focus:ring-black"
                        classNamePrefix="select"
                        onChange={handleChange}
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                borderWidth: '2px',
                                borderColor: 'black',
                                boxShadow: state.isFocused ? '0 0 0 1px black' : 'none',
                                '&:hover': {
                                    borderColor: 'black',
                                },
                                borderRadius: '0.375rem', // rounded-md
                                minHeight: '2.5rem', // h-10
                            }),
                        }}
                    />
                </div>
                {loading && <div className=" flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}
                {!loading && !Error ?
                    <div className="flex flex-col gap-5">
                        {filteredFormData.length > 0 ? <div className="rounded-lg overflow-hidden border shadow-xl">
                            <Table className="border">
                                <TableBody className="rounded-xl">
                                    {Object.entries(
                                        paginatedResponses.reduce((acc: any, response: any) => {
                                            if (!acc[response.formId]) acc[response.formId] = [];
                                            acc[response.formId].push(response);
                                            return acc;
                                        }, {})
                                    ).map(([formId, responses]: any) => (
                                        <Fragment key={formId}>
                                            {/* Render the form title once */}
                                            <TableRow className="bg-gray-100 font-semibold">
                                                <TableCell className="px-4 py-3 text-xl capitalize" colSpan={1}>
                                                    {responses[0].formTitle}
                                                </TableCell>
                                            </TableRow>

                                            {/* Render responses under this form */}
                                            {responses.map((response: any) => (
                                                <TableRow key={response.id} className="group bg-gray-50 h-10">
                                                    <TableCell className="px-6 py-3 flex justify-between items-center text-gray-700 font-medium">
                                                        <span className="ml-9">Response {response.responseIndex}</span>
                                                        <Button
                                                            onClick={() => handleClick(response.formId, response.id)}
                                                            className="visible h-fit bg-black text-white px-4 py-1 rounded-sm hover:bg-[#4e4c4c]"
                                                        >
                                                            View Response
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </Fragment>
                                    ))}
                                </TableBody>


                            </Table>

                        </div> : <div className="text-md text-center bitcount-grid-double">No result found!</div>} </div> : !loading && <div className="text-xl font-semibold flex items-center justify-center text-center flex-col gap-3 h-screen"><img src={wrong} className="h-auto w-[60px]" />Oops! <br />Something Went Wrong.</div>}
                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50 cursor-pointer" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <span className="text-sm px-4 py-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50 cursor-pointer" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        )
    }
}
