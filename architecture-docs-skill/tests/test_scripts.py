import json
import os
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts"))
import build
import loc


def write(root, rel, text):
    path = os.path.join(root, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(text)


def git(root, *args):
    subprocess.run(["git", "-C", root, *args], check=True, capture_output=True)


def valid_doc(root):
    write(root, "src/a.rs", "fn a() {}\n")
    write(root, "src/b.rs", "fn b() {}\n")
    write(root, "src/c.rs", "fn c() {}\n")
    seq = lambda i: {"id": f"s{i}", "title": f"Flow {i}", "why": "w", "actors": ["A", "B"], "steps": [["A", "B", "call"], ["B", "B", "self"], ["B", "A", "reply"], ["A", "A", "done"]], "notes": [{"q": "q1", "a": "a1"}, {"q": "q2", "a": "a2"}], "code": ["src/a.rs:1"]}
    comp = lambda i, f: {"id": f"c{i}", "name": f"C{i}", "path": f, "how": "h", "facts": ["f"], "right": ["r"], "better": ["b"]}
    return {
        "project": "P", "path": root, "repo": "", "tagline": "t", "summary": ["one", "two", "three"],
        "stack": [{"layer": "Backend", "name": "Rust", "version": "1.91", "logo": "rust", "url": "https://www.rust-lang.org", "why": "w"}],
        "arch": {"nodes": [{"id": n, "label": n.upper(), "sub": "", "kind": "core", "col": i, "row": 0} for i, n in enumerate("abcdef")], "edges": [["a", "b", "x"]]},
        "sequences": [seq(1), seq(2), seq(3)],
        "components": [comp(1, "src/a.rs"), comp(2, "src/b.rs"), comp(3, "src/")],
        "tests": {"runner": "", "kinds": [{"kind": k, "status": "present" if k == "Unit" else "missing", "count": 3 if k == "Unit" else 0, "where": "src", "note": "n"} for k in build.TEST_KINDS]},
    }


class LocTest(unittest.TestCase):
    def test_counts_only_non_blank_source_lines_so_whitespace_does_not_inflate_the_size(self):
        with tempfile.TemporaryDirectory() as root:
            write(root, "main.rs", "fn main() {\n\n    run();\n}\n\n")
            write(root, "ui/app.tsx", "export const A = 1;\n")
            write(root, "ui/util.ts", "export const B = 2;\n")
            langs = {l["name"]: l for l in loc.count(root)["langs"]}
            self.assertEqual(langs["Rust"]["lines"], 3)
            self.assertEqual((langs["TypeScript"]["lines"], langs["TypeScript"]["files"]), (2, 2))

    def test_lock_files_json_images_and_dependency_folders_are_not_code(self):
        with tempfile.TemporaryDirectory() as root:
            write(root, "app.js", "a()\n")
            write(root, "package-lock.json", "{\n}\n")
            write(root, "node_modules/x/index.js", "big()\nbig()\n")
            with open(os.path.join(root, "logo.png"), "wb") as f:
                f.write(b"\x89PNG\0\0data")
            langs = loc.count(root)["langs"]
            self.assertEqual([(l["name"], l["lines"]) for l in langs], [("JavaScript", 1)])

    def test_in_a_git_repo_only_tracked_files_count_so_build_output_never_leaks_in(self):
        with tempfile.TemporaryDirectory() as root:
            git(root, "init", "-q")
            write(root, "kept.py", "x = 1\ny = 2\n")
            write(root, "generated.py", "z = 3\n")
            git(root, "add", "kept.py")
            langs = loc.count(root)["langs"]
            self.assertEqual([(l["name"], l["lines"], l["files"]) for l in langs], [("Python", 2, 1)])

    def test_excluded_generated_folders_and_globs_do_not_inflate_the_counts(self):
        with tempfile.TemporaryDirectory() as root:
            write(root, "index.html", "<p>\n")
            write(root, "generated/index.html", "<p>\n<p>\n")
            write(root, "reports/report-1.html", "<p>\n<p>\n<p>\n")
            result = loc.count(root, ["generated/", "reports/*.html"])
            self.assertEqual([(l["name"], l["lines"], l["files"]) for l in result["langs"]], [("HTML", 1, 1)])
            self.assertIn("generated/", result["note"])

    def test_markdown_is_reported_as_docs_not_as_a_language(self):
        with tempfile.TemporaryDirectory() as root:
            write(root, "README.md", "# T\n\ntext\n")
            result = loc.count(root)
            self.assertEqual((result["langs"], result["docs"]), ([], 2))


class GithubUrlTest(unittest.TestCase):
    def test_ssh_and_https_remotes_link_to_the_subfolder_on_the_current_branch(self):
        expected = "https://github.com/o/r/tree/main/apps/web"
        self.assertEqual(build.github_url("git@github.com:o/r.git", "apps/web/", "main"), expected)
        self.assertEqual(build.github_url("https://github.com/o/r.git", "apps/web/", "main"), expected)

    def test_repo_root_links_to_the_repo_and_non_github_remotes_get_no_link(self):
        self.assertEqual(build.github_url("https://github.com/o/r", "", "dev"), "https://github.com/o/r")
        self.assertEqual(build.github_url("git@gitlab.com:o/r.git", "", "main"), "")


class ValidateTest(unittest.TestCase):
    def test_a_valid_document_passes(self):
        with tempfile.TemporaryDirectory() as root:
            build.validate(valid_doc(root))

    def test_a_component_path_that_does_not_exist_fails_so_invented_files_never_ship(self):
        with tempfile.TemporaryDirectory() as root:
            doc = valid_doc(root)
            doc["components"][0]["path"] = "src/invented.rs"
            with self.assertRaisesRegex(build.DataError, "invented.rs does not exist"):
                build.validate(doc)

    def test_a_step_with_an_unknown_actor_fails_because_the_diagram_would_draw_nothing(self):
        with tempfile.TemporaryDirectory() as root:
            doc = valid_doc(root)
            doc["sequences"][0]["steps"].append(["A", "Ghost", "call"])
            with self.assertRaisesRegex(build.DataError, "actor not in actors"):
                build.validate(doc)

    def test_two_nodes_in_the_same_cell_fail_because_they_would_overlap(self):
        with tempfile.TemporaryDirectory() as root:
            doc = valid_doc(root)
            doc["arch"]["nodes"][1]["col"] = 0
            with self.assertRaisesRegex(build.DataError, "already sits"):
                build.validate(doc)

    def test_a_missing_test_kind_with_a_count_fails_because_the_counters_would_contradict(self):
        with tempfile.TemporaryDirectory() as root:
            doc = valid_doc(root)
            doc["tests"]["kinds"][0].update(status="missing", count=4)
            with self.assertRaisesRegex(build.DataError, "missing with count 4"):
                build.validate(doc)

    def test_a_kind_that_does_not_apply_cannot_carry_a_count(self):
        with tempfile.TemporaryDirectory() as root:
            doc = valid_doc(root)
            doc["tests"]["kinds"][0].update(status="n/a", count=0)
            build.validate(doc)
            doc["tests"]["kinds"][0]["count"] = 2
            with self.assertRaisesRegex(build.DataError, "n/a with count 2"):
                build.validate(doc)

    def test_a_label_over_its_limit_fails_because_it_would_spill_out_of_its_box(self):
        with tempfile.TemporaryDirectory() as root:
            doc = valid_doc(root)
            doc["arch"]["nodes"][0]["label"] = "A label far too long"
            with self.assertRaisesRegex(build.DataError, "at most 16"):
                build.validate(doc)

    def test_test_kinds_out_of_order_fail_so_every_site_reads_the_same_way(self):
        with tempfile.TemporaryDirectory() as root:
            doc = valid_doc(root)
            kinds = doc["tests"]["kinds"]
            kinds[0], kinds[1] = kinds[1], kinds[0]
            with self.assertRaisesRegex(build.DataError, "must start with"):
                build.validate(doc)

    def test_too_few_sequences_fail_because_the_skill_promises_three_to_five(self):
        with tempfile.TemporaryDirectory() as root:
            doc = valid_doc(root)
            doc["sequences"] = doc["sequences"][:2]
            with self.assertRaisesRegex(build.DataError, "sequences: expected 3-5"):
                build.validate(doc)


class BuildTest(unittest.TestCase):
    def test_build_writes_a_self_contained_site_with_run_and_stop_scripts(self):
        with tempfile.TemporaryDirectory() as root, tempfile.TemporaryDirectory() as out:
            data = os.path.join(out, "in.json")
            with open(data, "w") as f:
                json.dump(valid_doc(root), f)
            build.build(data, out)
            html = open(os.path.join(out, "index.html")).read()
            self.assertNotIn("/*__DOC__*/", html)
            self.assertNotIn("<script src", html)
            self.assertNotIn("<link", html)
            for name in ["run.sh", "stop.sh"]:
                self.assertTrue(os.access(os.path.join(out, name), os.X_OK))
            built = json.load(open(os.path.join(out, "data.json")))
            self.assertEqual(built["loc"]["langs"][0]["name"], "Rust")

    def test_text_with_a_closing_script_tag_cannot_break_out_of_the_page(self):
        doc = {"project": "P", "tagline": "</script><img src=x onerror=alert(1)>"}
        html = build.render(doc, {})
        self.assertEqual(html.count("</script>"), 1)

    def test_only_logos_the_site_uses_are_embedded_and_unknown_ones_are_reported(self):
        doc = {"stack": [{"logo": "rust"}, {"logo": "not-a-real-logo"}, {}], "loc": {"langs": [{"logo": "typescript"}, {"logo": ""}]}}
        logos, unknown = build.used_logos(doc)
        self.assertEqual(sorted(logos), ["github", "rust", "typescript"])
        self.assertEqual(unknown, ["not-a-real-logo"])

    def test_the_same_data_always_builds_the_same_file_so_rebuilds_show_no_false_diffs(self):
        script = "import sys; sys.path.insert(0, sys.argv[1]); import build, json; print(json.dumps(build.used_logos({'stack': [{'logo': l} for l in ['vite', 'rust', 'react', 'go', 'bun']], 'loc': {'langs': []}})[0]))"
        scripts = os.path.dirname(build.__file__)
        outputs = {subprocess.run([sys.executable, "-B", "-c", script, scripts], env={**os.environ, "PYTHONHASHSEED": str(seed)}, capture_output=True, text=True, check=True).stdout for seed in range(6)}
        self.assertEqual(len(outputs), 1)


if __name__ == "__main__":
    unittest.main()
