import { useState, useMemo } from 'react';
import {
  hoiBooksStorage,
  hoiBookIssuesStorage,
  hoiStudentsStorage,
  HoiBook,
  HoiBookIssue,
  HoiStudent,
} from '@/lib/hoiStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Edit,
  Trash2,
  RotateCcw,
  Bell,
  AlertTriangle,
} from 'lucide-react';

const ROWS_PER_PAGE = 10;

const BOOK_CATEGORIES = ['textbook', 'fiction', 'reference', 'periodical'] as const;

const categoryBadgeColors: Record<string, string> = {
  textbook: 'bg-blue-100 text-blue-700 border-blue-200',
  fiction: 'bg-purple-100 text-purple-700 border-purple-200',
  reference: 'bg-amber-100 text-amber-700 border-amber-200',
  periodical: 'bg-green-100 text-green-700 border-green-200',
};

export default function HoiLibrary() {
  const { toast } = useToast();

  const [books, setBooks] = useState<HoiBook[]>(() => hoiBooksStorage.getAll());
  const [issues, setIssues] = useState<HoiBookIssue[]>(() => hoiBookIssuesStorage.getAll());
  const students = useMemo<HoiStudent[]>(() => hoiStudentsStorage.getAll(), []);

  const [bookSearch, setBookSearch] = useState('');
  const [bookCategoryFilter, setBookCategoryFilter] = useState('all');
  const [bookPage, setBookPage] = useState(1);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<HoiBook | null>(null);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issuePage, setIssuePage] = useState(1);
  const [overduePage, setOverduePage] = useState(1);

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    copies_available: '',
    total_copies: '',
    category: 'textbook' as HoiBook['category'],
  });

  const [issueForm, setIssueForm] = useState({
    student_id: '',
    book_id: '',
    date_issued: new Date().toISOString().split('T')[0],
    due_date: '',
  });

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase());
      const matchCategory = bookCategoryFilter === 'all' || b.category === bookCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [books, bookSearch, bookCategoryFilter]);

  const bookTotalPages = Math.max(1, Math.ceil(filteredBooks.length / ROWS_PER_PAGE));
  const paginatedBooks = filteredBooks.slice((bookPage - 1) * ROWS_PER_PAGE, bookPage * ROWS_PER_PAGE);

  const issuedBooks = useMemo(() => issues.filter((i) => i.status === 'issued'), [issues]);
  const issuedTotalPages = Math.max(1, Math.ceil(issuedBooks.length / ROWS_PER_PAGE));
  const paginatedIssued = issuedBooks.slice((issuePage - 1) * ROWS_PER_PAGE, issuePage * ROWS_PER_PAGE);

  const overdueBooks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return issues.filter((i) => {
      if (i.status === 'returned') return false;
      const due = new Date(i.due_date);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
  }, [issues]);
  const overdueTotalPages = Math.max(1, Math.ceil(overdueBooks.length / ROWS_PER_PAGE));
  const paginatedOverdue = overdueBooks.slice((overduePage - 1) * ROWS_PER_PAGE, overduePage * ROWS_PER_PAGE);

  const getDaysOverdue = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const resetBookForm = () => {
    setBookForm({ title: '', author: '', isbn: '', copies_available: '', total_copies: '', category: 'textbook' });
    setEditingBook(null);
  };

  const resetIssueForm = () => {
    setIssueForm({
      student_id: '',
      book_id: '',
      date_issued: new Date().toISOString().split('T')[0],
      due_date: '',
    });
  };

  const handleOpenAddBook = () => {
    resetBookForm();
    setBookDialogOpen(true);
  };

  const handleOpenEditBook = (book: HoiBook) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies_available: book.copies_available.toString(),
      total_copies: book.total_copies.toString(),
      category: book.category,
    });
    setBookDialogOpen(true);
  };

  const handleSaveBook = () => {
    if (!bookForm.title.trim() || !bookForm.author.trim() || !bookForm.isbn.trim() || !bookForm.copies_available || !bookForm.total_copies) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const copies_available = parseInt(bookForm.copies_available);
    const total_copies = parseInt(bookForm.total_copies);
    if (isNaN(copies_available) || isNaN(total_copies) || copies_available < 0 || total_copies <= 0) {
      toast({ title: 'Validation Error', description: 'Copies must be valid positive numbers.', variant: 'destructive' });
      return;
    }
    if (copies_available > total_copies) {
      toast({ title: 'Validation Error', description: 'Available copies cannot exceed total copies.', variant: 'destructive' });
      return;
    }

    if (editingBook) {
      hoiBooksStorage.update(editingBook.id, {
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        isbn: bookForm.isbn.trim(),
        copies_available,
        total_copies,
        category: bookForm.category,
      });
      toast({ title: 'Success', description: 'Book updated successfully.' });
    } else {
      hoiBooksStorage.add({
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        isbn: bookForm.isbn.trim(),
        copies_available,
        total_copies,
        category: bookForm.category,
      });
      toast({ title: 'Success', description: 'Book added successfully.' });
    }

    setBooks(hoiBooksStorage.getAll());
    setBookDialogOpen(false);
    resetBookForm();
  };

  const handleDeleteBook = (id: string) => {
    hoiBooksStorage.remove(id);
    setBooks(hoiBooksStorage.getAll());
    toast({ title: 'Deleted', description: 'Book removed from library.' });
  };

  const handleIssueBook = () => {
    if (!issueForm.student_id || !issueForm.book_id || !issueForm.date_issued || !issueForm.due_date) {
      toast({ title: 'Validation Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (new Date(issueForm.due_date) <= new Date(issueForm.date_issued)) {
      toast({ title: 'Validation Error', description: 'Due date must be after issue date.', variant: 'destructive' });
      return;
    }

    const student = students.find((s) => s.id === issueForm.student_id);
    const book = books.find((b) => b.id === issueForm.book_id);
    if (!student || !book) {
      toast({ title: 'Error', description: 'Invalid student or book selection.', variant: 'destructive' });
      return;
    }
    if (book.copies_available <= 0) {
      toast({ title: 'Error', description: 'No copies available for this book.', variant: 'destructive' });
      return;
    }

    hoiBookIssuesStorage.add({
      book_id: book.id,
      book_title: book.title,
      student_id: student.id,
      student_name: student.full_name,
      date_issued: issueForm.date_issued,
      due_date: issueForm.due_date,
      status: 'issued',
    });

    hoiBooksStorage.update(book.id, { copies_available: book.copies_available - 1 });

    setBooks(hoiBooksStorage.getAll());
    setIssues(hoiBookIssuesStorage.getAll());
    setIssueDialogOpen(false);
    resetIssueForm();
    toast({ title: 'Success', description: `"${book.title}" issued to ${student.full_name}.` });
  };

  const handleReturnBook = (issue: HoiBookIssue) => {
    const today = new Date().toISOString().split('T')[0];
    hoiBookIssuesStorage.update(issue.id, {
      status: 'returned',
      date_returned: today,
    });

    const book = books.find((b) => b.id === issue.book_id);
    if (book) {
      hoiBooksStorage.update(book.id, { copies_available: book.copies_available + 1 });
    }

    setBooks(hoiBooksStorage.getAll());
    setIssues(hoiBookIssuesStorage.getAll());
    toast({ title: 'Returned', description: `"${issue.book_title}" returned successfully.` });
  };

  const handleSendReminder = (issue: HoiBookIssue) => {
    toast({
      title: 'Reminder Sent',
      description: `Reminder sent to ${issue.student_name} for "${issue.book_title}".`,
    });
  };

  const PaginationControls = ({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) => (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Library Management</h1>
        <p className="text-muted-foreground">Manage books, issue/return, and track overdue items.</p>
      </div>

      <Tabs defaultValue="books" className="space-y-4">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="issues">Issue / Return</TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            {overdueBooks.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">{overdueBooks.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg">Book Catalogue</CardTitle>
                <Button size="sm" onClick={handleOpenAddBook}>
                  <Plus className="w-4 h-4 mr-1" /> Add Book
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or author..."
                    value={bookSearch}
                    onChange={(e) => { setBookSearch(e.target.value); setBookPage(1); }}
                    className="pl-9"
                  />
                </div>
                <Select value={bookCategoryFilter} onValueChange={(v) => { setBookCategoryFilter(v); setBookPage(1); }}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {BOOK_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBooks.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No books found.</TableCell></TableRow>
                  ) : paginatedBooks.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.title}</TableCell>
                      <TableCell>{b.author}</TableCell>
                      <TableCell className="font-mono text-xs">{b.isbn}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${categoryBadgeColors[b.category] || ''}`}>{b.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={b.copies_available === 0 ? 'text-red-600 font-semibold' : ''}>{b.copies_available}</span>
                      </TableCell>
                      <TableCell>{b.total_copies}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditBook(b)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteBook(b.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls page={bookPage} totalPages={bookTotalPages} setPage={setBookPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg">Currently Issued Books</CardTitle>
                <Button size="sm" onClick={() => { resetIssueForm(); setIssueDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Issue Book
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedIssued.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No books currently issued.</TableCell></TableRow>
                  ) : paginatedIssued.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.book_title}</TableCell>
                      <TableCell>{issue.student_name}</TableCell>
                      <TableCell>{new Date(issue.date_issued).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(issue.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Issued</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleReturnBook(issue)}>
                          <RotateCcw className="w-4 h-4 mr-1" /> Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls page={issuePage} totalPages={issuedTotalPages} setPage={setIssuePage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <CardTitle className="text-lg">Overdue Books</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOverdue.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No overdue books.</TableCell></TableRow>
                  ) : paginatedOverdue.map((issue) => {
                    const daysOverdue = getDaysOverdue(issue.due_date);
                    return (
                      <TableRow key={issue.id} className="bg-red-50/50">
                        <TableCell className="font-medium">{issue.book_title}</TableCell>
                        <TableCell>{issue.student_name}</TableCell>
                        <TableCell>{new Date(issue.date_issued).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(issue.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="font-bold">{daysOverdue} days</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleReturnBook(issue)}>
                              <RotateCcw className="w-4 h-4 mr-1" /> Return
                            </Button>
                            <Button size="sm" variant="outline" className="text-amber-600" onClick={() => handleSendReminder(issue)}>
                              <Bell className="w-4 h-4 mr-1" /> Remind
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <PaginationControls page={overduePage} totalPages={overdueTotalPages} setPage={setOverduePage} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> {editingBook ? 'Edit Book' : 'Add Book'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Book title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Author *</label>
                <Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ISBN *</label>
                <Input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} placeholder="978-XXXX" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Available *</label>
                <Input type="number" value={bookForm.copies_available} onChange={(e) => setBookForm({ ...bookForm, copies_available: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Total Copies *</label>
                <Input type="number" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={bookForm.category} onValueChange={(v) => setBookForm({ ...bookForm, category: v as HoiBook['category'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BOOK_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBook}>{editingBook ? 'Update Book' : 'Add Book'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Issue Book
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Student *</label>
              <Select value={issueForm.student_id} onValueChange={(v) => setIssueForm({ ...issueForm, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.admission_no})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Book *</label>
              <Select value={issueForm.book_id} onValueChange={(v) => setIssueForm({ ...issueForm, book_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                <SelectContent>
                  {books.filter((b) => b.copies_available > 0).map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.title} ({b.copies_available} available)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Date Issued *</label>
                <Input type="date" value={issueForm.date_issued} onChange={(e) => setIssueForm({ ...issueForm, date_issued: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Due Date *</label>
                <Input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleIssueBook}>Issue Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}