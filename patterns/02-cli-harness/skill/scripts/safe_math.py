import ast
import operator
from collections.abc import Callable

MAX_LENGTH = 200
MAX_EXPONENT = 100

Number = int | float

BINARY: dict[type[ast.operator], Callable[[Number, Number], Number]] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

UNARY: dict[type[ast.unaryop], Callable[[Number], Number]] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}


class MathError(ValueError):
    pass


def evaluate(expression: str) -> Number:
    text = expression.strip().replace("^", "**")
    if not text:
        raise MathError("empty expression")
    if len(text) > MAX_LENGTH:
        raise MathError(f"expression longer than {MAX_LENGTH} characters")
    try:
        tree = ast.parse(text, mode="eval")
    except SyntaxError:
        raise MathError(f"not an arithmetic expression: {expression}") from None
    try:
        return node_value(tree.body)
    except ZeroDivisionError:
        raise MathError("division by zero") from None


def node_value(node: ast.expr) -> Number:
    match node:
        case ast.Constant(value=bool()):
            raise MathError("booleans are not numbers here")
        case ast.Constant(value=int() | float() as value):
            return value
        case ast.UnaryOp(op=op, operand=operand) if type(op) in UNARY:
            return UNARY[type(op)](node_value(operand))
        case ast.BinOp(left=left, op=op, right=right) if type(op) in BINARY:
            lhs, rhs = node_value(left), node_value(right)
            if isinstance(op, ast.Pow) and abs(rhs) > MAX_EXPONENT:
                raise MathError(f"exponent larger than {MAX_EXPONENT}")
            return BINARY[type(op)](lhs, rhs)
    raise MathError(f"{type(node).__name__} is not allowed")


def format_number(value: Number) -> str:
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(round(value, 10)) if isinstance(value, float) else str(value)
